import { Tabs } from "antd";
import { Modal, Card, CrossChainCard } from "../components";

export default function MainCard() {
  const { TabPane } = Tabs;
  return (
    <div className="home">
      <div id="card" className="card p-8">
        <Modal />
        {/* <Tabs type="card">
          <TabPane tab="Component" key="1">
            
          </TabPane>
          <TabPane tab="Simple" key="2">
            <CrossChainCard />
          </TabPane>
          <TabPane tab="Advanced" key="3">
            <Card />
          </TabPane>
        </Tabs> */}
      </div>
    </div>
  );
}
