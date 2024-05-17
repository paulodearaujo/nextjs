import {authorizeWebflow} from '@/lib/auth';

const HomePage = () => {
    return (
        <div>
            <h1>Bem-vindo</h1>
    <button onClick={authorizeWebflow}>Autorizar com Webflow</button>
    </div>
);
};

export default HomePage;
