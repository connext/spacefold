import React, { FunctionComponent } from 'react';

import { ConnextButtons, Message, SendButton, CancelButton } from './connext-modal.style';
interface ConnextModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}
export const ConnextModal: FunctionComponent<ConnextModalProps> = (props) => {
  return (
    <React.Fragment>
      <Message>{props.message}</Message>
      <ConnextButtons>
        <SendButton onClick={props.onConfirm}>Send</SendButton>
        <CancelButton onClick={props.onCancel}>Cancel</CancelButton>
      </ConnextButtons>
    </React.Fragment>
  );
};