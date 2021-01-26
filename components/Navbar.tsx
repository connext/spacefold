import { GitHub, Info, MessageCircle } from "react-feather";

export default function Navbar() {
  return (
    <div className="More-Buttons">
      <img
        src="SpacefoldLogoPurple.png"
        style={{ height: "100px", paddingRight: "100px" }}
      />
      <a
        href="https://www.notion.so/Spacefold-Guide-Walkthrough-5100d3bd1463451eb072e91f6e1c7d5d"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <Info className="About-Icon" /> Help
      </a>
      <a
        href="https://github.com/connext/spacefold"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <GitHub className="Github-Icon" /> GitHub
      </a>
      <a
        href="https://discord.com/channels/454734546869551114"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center"
      >
        <MessageCircle className="Discord-Icon" /> Chat
      </a>
    </div>
  );
}
