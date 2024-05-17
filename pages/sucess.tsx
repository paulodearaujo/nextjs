import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {fetchWebflowData} from '@/lib/webflow';

const SuccessPage = () => {
    const router = useRouter();
    const { access_token } = router.query;

    useEffect(() => {
        if (access_token) {
            // Armazene o token no localStorage ou use-o conforme necessário
            localStorage.setItem('webflow_access_token', access_token as string);

            // Exemplo de uso do token para obter dados do Webflow
            const fetchData = async () => {
                try {
                    const data = await fetchWebflowData(access_token as string);
                    console.log('Data from Webflow:', data);
                } catch (error) {
                    console.error('Failed to fetch data:', error);
                }
            };

            fetchData();
        }
    }, [access_token]);

    return <div>Autenticação bem-sucedida! Você pode fechar esta página.</div>;
};

export default SuccessPage;
