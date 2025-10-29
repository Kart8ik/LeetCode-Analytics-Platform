import React from "react";
import { Button } from "@/components/ui/button";

const Homepage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to the Homepage</h1>
      <Button  size="lg">
        Get Started
      </Button>
    </div>
  );
};

export default Homepage;