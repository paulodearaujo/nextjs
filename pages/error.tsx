import {useRouter} from 'next/router';

const ErrorPage = () => {
    const router = useRouter();
    const { error } = router.query;

    return <div>Ocorreu um erro: {error}</div>;
};

export default ErrorPage;
