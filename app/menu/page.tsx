import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";

const MenuPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <Card className="w-full max-w-4xl mx-auto shadow-lg rounded-lg bg-gray-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-4">Menu</CardTitle>
          <CardDescription className="text-center mb-4">
            Choose an option to proceed
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center space-x-4">
          <Link href={{ pathname: '/identify-hyperlinks' }}>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Identify existing hyperlinks</Button>
          </Link>
          <Link href={{ pathname:'/discover-opportunities' }}>
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Discover hyperlink opportunities</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
    );
};

export default MenuPage;
