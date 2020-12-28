export const TRANSFER_STATES = {
  INITIAL: 'INITIAL',
  DEPOSITING: 'DEPOSITING',
  TRANSFERRING: 'TRANSFERRING',
  WITHDRAWING: 'WITHDRAWING',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
} as const;
export type TransferStates = keyof typeof TRANSFER_STATES;

export type ConnextModalProps = {
  showModal: boolean;
  depositChainId: number;
  depositAssetId: string;
  withdrawChainId: number;
  withdrawAssetId: string;
  withdrawalAddress: string;
  onClose: () => void;
};
