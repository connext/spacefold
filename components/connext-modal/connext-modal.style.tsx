import styled from 'styled-components';
export const ConnextButtons = styled.div`
  display: flex;
  justify-content: center;
`;
export const Message = styled.div`
  font-size: 0.9rem;
  margin-bottom: 10px;
  text-align: center;
`;
export const SendButton = styled.button`
  width: 6rem;
  background-color: blue;
  :hover {
    background-color: green;
  }
`;
export const CancelButton = styled.button`
  width: 3rem;
  background-color: lightgrey;
  :hover {
    background-color: grey;
  }
`;