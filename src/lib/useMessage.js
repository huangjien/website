import { useSessionStorageState } from 'ahooks';

// This function returns a hook that stores the state of a session storage item
export const useMessage = (initialMessage) => {
  // Get the message from the session storage
  const [msg, setMsg] = useSessionStorageState('message', {
    // Set the default value of the message to the initialMessage
    defaultValue: initialMessage,
  });
  // Set the fatal function to set the message to an error
  const fatal = (message) => {
    setMsg({ messageType: 'Error', message: message, color: 'error' });
  };
  // Set the warning function to set the message to a warning
  const warning = (message) => {
    setMsg({ messageType: 'Warning', message: message, color: 'warning' });
  };
  // Set the success function to set the message to a success
  const success = (message) => {
    setMsg({ messageType: 'Success', message: message, color: 'success' });
    setMsg({ messageType: 'Success', message: message, color: 'success' });
  };
  // Set the info function to set the message to a primary
  const info = (message) => {
    setMsg({ messageType: 'Info', message: message, color: 'primary' });
  };
  // Set the clear function to clear the message
  const clear = () => {
    setMsg(undefined);
  };
  // Get the messageType from the message
  const messageType = () => {
    return msg ? msg.messageType : '';
  };

  // Get the messageContent from the message
  const messageContent = () => {
    return msg ? msg.message : '';
  };

  // Get the messageColor from the message
  const messageColor = () => {
    return msg ? msg.color : '';
  };

  // Return the message, fatal, warning, success, info, clear, messageType, messageContent, and messageColor
  return [
    msg,
    fatal,
    warning,
    success,
    info,
    clear,
    messageType,
    messageContent,
    messageColor,
  ];
};
