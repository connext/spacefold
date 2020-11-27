import { faGithub, faDiscord } from "@fortawesome/free-brands-svg-icons";
import { faInfo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Navbar() {
  return (
    <div className="More-Buttons">
      <a
        href="https://github.com/connext/spacefold"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon className="Github-Icon" icon={faGithub} /> GitHub
      </a>
      <a
        href="https://discord.com/channels/454734546869551114"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon className="Discord-Icon" icon={faDiscord} /> Chat
      </a>
      <a
        href="https://medium.com/connext/introducing-spacefold-d1c227a29d3"
        target="_blank"
        rel="noopener noreferrer"
      >
        <FontAwesomeIcon className="About-Icon" icon={faInfo} /> About
      </a>
    </div>
  );
}
