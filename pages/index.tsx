import React, { Component, FunctionComponent, useState } from 'react';
import { ReactDOM, render } from 'react-dom';
import { IMAGE_PATH } from "../constants";

import { Modal } from '../components/modal-button/modal-button';
import { ConnextModal } from '../components/connext-modal/connext-modal';
import { useModal } from '../useModal';

const App: FunctionComponent = () => {
  const { isShown, toggle } = useModal();
  const onConfirm = () => toggle();
  const onCancel = () => toggle();
  return (
    <React.Fragment>
      <button onClick={toggle}> <img src={IMAGE_PATH.icon.connext} /> Send</button>
      <Modal
        isShown={isShown}
        hide={toggle}
        headerText="Connext Modal for Send"
        modalContent={
          <ConnextModal
            onConfirm={onConfirm}
            onCancel={onCancel}
            message="This is the address to send token to:"
          />
        }
      />
    </React.Fragment>
  );
};


export default App
