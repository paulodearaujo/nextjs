import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useWebflowData} from '@/context/WebflowDataContext';

const MenuPage = () => {
  const { fetchWebflowItems } = useWebflowData();

  const handleUpdateData = async () => {
    try {
      await fetchWebflowItems();
      alert('Data updated successfully.');
    } catch (error) {
      console.error('Error updating data:', error);
      alert('Failed to update data.');
    }
  };

  return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg bg-gray-800 text-white">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center mb-4">Menu</CardTitle>
                    <CardDescription className="text-center mb-4">
                        Choose an option to proceed
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center space-x-4">
                    <Link href={{ pathname: '/identify-hyperlinks' }}>
                        <Button className="bg-gray-700 text-white hover:bg-gray-600">Identify existing hyperlinks</Button>
                    </Link>
                    <Link href={{ pathname: '/discover-opportunities' }}>
                        <Button className="bg-gray-700 text-white hover:bg-gray-600">Discover hyperlink opportunities</Button>
                    </Link>
                    <Button onClick={handleUpdateData} className="bg-gray-700 text-white hover:bg-gray-600">
                        Update Webflow Data
                    </Button>
                </CardContent>
            </Card>
        </div>
  );
};

export default MenuPage;
