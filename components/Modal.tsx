import React, { useState } from "react";
import { ConnextModal } from "@connext/vector-modal";

export default function Modal() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        type="button"
        className="First-Button"
        onClick={() => setShowModal(true)}
      >
        Goerli to Matic Testnet
      </button>
      <ConnextModal
        showModal={showModal}
        depositAssetId={"0x655F2166b0709cd575202630952D71E2bB0d61Af"}
        depositChainId={5}
        withdrawAssetId={"0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1"}
        withdrawChainId={80001}
        withdrawalAddress={"0x5A9e792143bf2708b4765C144451dCa54f559a19"}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}
