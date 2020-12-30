import React, { useState } from "react";
import { ConnextModal } from "@connext/vector-modal";
import { Button, Divider, Form, Input } from "antd";

export default function Modal() {
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  return (
    <>
      <Form form={form} onFinish={() => setShowModal(true)}>
        <Form.Item
          name="withdrawalAddress"
          rules={[
            { required: true, message: "Please input withdrawal address!" },
          ]}
        >
          <Input placeholder="Withdrawal Address" />
        </Form.Item>
        <Divider />
        <Form.Item>
          <button type="submit" className="First-Button">
            Goerli to Matic Testnet
          </button>
        </Form.Item>
      </Form>
      <ConnextModal
        showModal={showModal}
        routerPublicIdentifier="vector6vHve47eegn1uW2Pvexpwh2XyadVUHAb3ZxtjH4RXncMy8DaFT"
        depositAssetId={"0x76EB2542043B34b08620f6960f131a9bDaC2D578"}
        depositChainId={5}
        withdrawAssetId={"0x455302a6e83f8B03a3E2e576CccbaDc005a46b39"}
        withdrawChainId={80001}
        withdrawalAddress={form.getFieldValue("withdrawalAddress")}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
