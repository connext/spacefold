import { Tabs } from "antd";
import { Card, CrossChainCard } from "../components";

export default function MainCard() {
  const { TabPane } = Tabs;
  return (
    <div className="home">
      <div id="card" className="card p-8">
        <Tabs type="card">
          <TabPane tab="Simple" key="1">
            <CrossChainCard />
          </TabPane>
          <TabPane tab="Advance" key="2">
            <Card />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
