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
        depositAssetId={"0x655F2166b0709cd575202630952D71E2bB0d61Af"}
        depositChainId={5}
        withdrawAssetId={"0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1"}
        withdrawChainId={80001}
        withdrawalAddress={form.getFieldValue("withdrawalAddress")}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
