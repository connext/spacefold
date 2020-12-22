import { faHeart } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function Footer() {
  return (
    <a
      className="Footer"
      href="https://connext.network/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Made with <FontAwesomeIcon icon={faHeart} /> by Connext
    </a>
  );
}
