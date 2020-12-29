import { GithubOutlined, InfoCircleOutlined } from "@ant-design/icons";

export default function Navbar() {
  return (
    <div className="More-Buttons">
      <a
        href="https://github.com/connext/spacefold"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <GithubOutlined className="Github-Icon" /> GitHub
      </a>
      <a
        href="https://discord.com/channels/454734546869551114"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        Chat
      </a>
      <a
        href="https://medium.com/connext/introducing-spacefold-d1c227a29d3"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <InfoCircleOutlined className="About-Icon" /> About
      </a>
    </div>
  );
}
