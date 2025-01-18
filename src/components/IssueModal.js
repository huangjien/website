import {
  Modal,
  ModalContent,
  ModalBody,
  useDisclosure,
  ModalFooter,
  Button,
  Input,
  CheckboxGroup,
  Checkbox,
  Divider,
  Textarea,
} from "@nextui-org/react";
import { BiEdit, BiListPlus } from "react-icons/bi";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { useState } from "react";

export const IssueModal = ({ issue, action }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState(issue ? issue?.title : "");
  const [content, setContent] = useState(issue ? issue?.body : "");

  return (
    <>
      {action === "edit" && (
        <Button className='bg-transparent' onPress={onOpen}>
          <BiEdit className='h-8 w-8 bg-transparent text-primary' />
        </Button>
      )}
      {action === "new" && (
        <Button className='bg-transparent' onPress={onOpen}>
          <BiListPlus className='h-8 w-8 bg-transparent text-primary' />
        </Button>
      )}
      <Modal
        scrollBehavior='inside'
        className='m-2'
        size='full'
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                <div>
                  <div className='lg:inline-flex align-middle w-full justify-evenly gap-4 m-2'>
                    <Input
                      isRequired={true}
                      label={"Title"}
                      className=' w-1/2 m-2'
                      aria-label='title'
                      value={title}
                      onChange={setTitle}
                      placeholder='Please input issue title here...'
                    />
                    <CheckboxGroup
                      label={"Select Tags"}
                      className='m2 w-1/2'
                      orientation='horizontal'
                    >
                      <Checkbox value='blog'>blog</Checkbox>
                      <Checkbox value='programming'>programming</Checkbox>
                      <Checkbox value='devops'>devops</Checkbox>
                      <Checkbox value='testing'>testing</Checkbox>
                      <Checkbox value='novel'>novel</Checkbox>
                    </CheckboxGroup>
                  </div>
                  <Divider />
                  <div className='grid grid-cols-1 lg:grid-cols-2 w-full h-full m-2 gap-4 overflow-auto space-x-3 justify-evenly '>
                    <Textarea
                      className='m-2 h-full w-full resize-none '
                      size={"lg"}
                      variant='underlined'
                      value={content}
                      minRows={16}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder='Please input issue content here, in markdown format ...'
                    ></Textarea>

                    <div className='hidden lg:block m-2'>
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                      >
                        {content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose}>
                  Close
                </Button>
                <Button color='primary' onPress={onClose}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
