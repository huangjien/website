#!/usr/bin/env python3

"""Create or update the Jenkins pipeline job for this repository."""

from __future__ import annotations

import argparse
import base64
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


def build_auth_header(username: str, token: str) -> str:
  raw = f"{username}:{token}".encode("utf-8")
  return "Basic " + base64.b64encode(raw).decode("ascii")


def request(url: str, *, method: str = "GET", data: bytes | None = None, headers: dict[str, str] | None = None) -> urllib.request.addinfourl:
  req = urllib.request.Request(url, data=data, method=method)
  for key, value in (headers or {}).items():
    req.add_header(key, value)
  return urllib.request.urlopen(req, timeout=30)


def get_crumb(base_url: str, headers: dict[str, str]) -> tuple[str, str]:
  with request(f"{base_url}/crumbIssuer/api/json", headers=headers) as response:
    payload = response.read().decode("utf-8")
  import json

  data = json.loads(payload)
  return data["crumbRequestField"], data["crumb"]


def job_exists(base_url: str, job_name: str, headers: dict[str, str]) -> bool:
  job_path = urllib.parse.quote(job_name, safe="")
  try:
    with request(f"{base_url}/job/{job_path}/api/json", headers=headers):
      return True
  except urllib.error.HTTPError as exc:
    if exc.code == 404:
      return False
    raise


def build_config_xml(jenkinsfile: str) -> str:
  return f"""<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <description>Managed from the website repository. Updates replace local Jenkins job config.</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script><![CDATA[{jenkinsfile}]]></script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
"""


def main() -> int:
  parser = argparse.ArgumentParser(description=__doc__)
  parser.add_argument("--jenkins-url", default=os.getenv("JENKINS_URL", "http://localhost:8888"), help="Base Jenkins URL.")
  parser.add_argument("--job-name", default=os.getenv("JENKINS_JOB_NAME", "website-ci-cd"), help="Pipeline job name.")
  parser.add_argument("--user", default=os.getenv("JENKINS_USER", "admin"), help="Jenkins username.")
  parser.add_argument("--jenkinsfile", default="Jenkinsfile", help="Path to the Jenkinsfile to publish.")
  args = parser.parse_args()

  token = os.getenv("JENKINS_TOKEN")
  if not token:
    print("JENKINS_TOKEN is required.", file=sys.stderr)
    return 1

  jenkinsfile_path = Path(args.jenkinsfile)
  if not jenkinsfile_path.is_file():
    print(f"Jenkinsfile not found: {jenkinsfile_path}", file=sys.stderr)
    return 1

  headers = {
    "Authorization": build_auth_header(args.user, token),
  }

  try:
    crumb_field, crumb_value = get_crumb(args.jenkins_url.rstrip("/"), headers)
  except urllib.error.HTTPError as exc:
    if exc.code in {401, 403}:
      print(
        "Failed to authenticate to Jenkins. Set JENKINS_USER to the correct username for JENKINS_TOKEN.",
        file=sys.stderr,
      )
      return 2
    raise

  headers[crumb_field] = crumb_value
  headers["Content-Type"] = "application/xml"

  config_xml = build_config_xml(jenkinsfile_path.read_text(encoding="utf-8")).encode("utf-8")
  job_name = args.job_name
  base_url = args.jenkins_url.rstrip("/")
  job_path = urllib.parse.quote(job_name, safe="")

  try:
    if job_exists(base_url, job_name, headers):
      with request(f"{base_url}/job/{job_path}/config.xml", method="POST", data=config_xml, headers=headers):
        print(f"Updated Jenkins job: {job_name}")
    else:
      create_url = f"{base_url}/createItem?name={urllib.parse.quote(job_name, safe='')}"
      with request(create_url, method="POST", data=config_xml, headers=headers):
        print(f"Created Jenkins job: {job_name}")
  except urllib.error.HTTPError as exc:
    if exc.code in {401, 403}:
      print(
        "Jenkins rejected the job create/update request. Verify JENKINS_USER/JENKINS_TOKEN has job admin access.",
        file=sys.stderr,
      )
      return 3
    raise

  return 0


if __name__ == "__main__":
  raise SystemExit(main())
