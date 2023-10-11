import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Tooltip,
  useDisclosure,
  ModalFooter,
  Button,
} from '@nextui-org/react';
import { BiEdit, BiListPlus } from 'react-icons/bi';
import { useGithubContent } from '@/lib/useGithubContent';

const IssueModal = ({ issue, action }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {action === 'edit' && (
        <Button>
          <BiEdit className="h-8 w-8 bg-transparent text-primary" />
        </Button>
      )}
      {action === 'new' && (
        <Button>
          <BiListPlus className="h-8 w-8 bg-transparent text-primary" />
        </Button>
      )}
      <Modal size="full" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody>
                {/* TODO: put markdown editor here, if it is a small screen, don't show preview part */}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
