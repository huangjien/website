import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Input from "./ui/input";
import { Select, SelectItem } from "./ui/select";
import { useSettings } from "../lib/useSettings";

/**
 * Configuration tab component for AI settings
 */
const ConfigurationTab = ({
  model,
  setModel,
  temperature,
  setTemperature,
  trackSpeed,
  setTrackSpeed,
}) => {
  const { t } = useTranslation();
  const { getSetting } = useSettings();

  const models = useMemo(() => {
    const defaultModels = [
      { key: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { key: "gpt-4.1", label: "GPT-4.1" },
      { key: "o1-mini", label: "o1-mini" },
      { key: "o1", label: "o1" },
      { key: "o3-mini", label: "o3-mini" },
    ];

    // Get models from settings if available
    const settingsModels = getSetting("models");
    if (settingsModels) {
      try {
        // Parse if it's a JSON string, otherwise use as is
        const parsedModels =
          typeof settingsModels === "string"
            ? JSON.parse(settingsModels)
            : settingsModels;

        // Validate that it's an array with proper structure and not empty
        if (
          Array.isArray(parsedModels) &&
          parsedModels.length > 0 &&
          parsedModels.every((m) => m.key && m.label)
        ) {
          return parsedModels;
        }
      } catch (error) {
        console.warn("Failed to parse models from settings:", error);
      }
    }

    return defaultModels;
  }, [getSetting]);

  return (
    <div className='flex flex-col gap-4'>
      <Select
        label={t("ai.select_model")}
        placeholder={t("ai.select_model")}
        selectedKeys={[model]}
        onSelectionChange={(keys) => setModel(Array.from(keys)[0])}
        className='max-w-xs'
      >
        {models.map((modelOption) => (
          <SelectItem key={modelOption.key} value={modelOption.key}>
            {modelOption.label}
          </SelectItem>
        ))}
      </Select>

      <Input
        type='number'
        label={t("ai.temperature")}
        placeholder={t("ai.value_range_0_1")}
        value={temperature.toString()}
        onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
        min={0}
        max={2}
        step={0.1}
        className='max-w-xs'
      />

      <Input
        type='number'
        label={t("ai.track_speed")}
        placeholder={t("ai.value_range_50_500")}
        value={trackSpeed.toString()}
        onChange={(e) => setTrackSpeed(parseInt(e.target.value) || 300)}
        min={50}
        max={500}
        step={10}
        className='max-w-xs'
      />
    </div>
  );
};

export default ConfigurationTab;
