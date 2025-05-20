import './App.scss'; // Import the SASS file
import githubLogo from './github-mark.svg';
const AppFooter = () => {
    return (
        <a href="https://github.com/Tthide/VizREvent" target="_blank" rel="noopener noreferrer">
            <img src={githubLogo} alt="GitHub's Logo" />
            VizREvent
        </a>);
};
export default AppFooter;