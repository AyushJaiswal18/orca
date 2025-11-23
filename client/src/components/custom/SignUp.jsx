import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useAuth } from "@/contexts/authContext";
import axios from "axios";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { authStatus, setauthStatus } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleSignup = async () => {
    try {
      const res = await axios.post("/users/register", {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      });
      setauthStatus(true);
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Some error occured.",
        description: error.response.data.message,
      });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  useEffect(() => {
    if (authStatus) {
      navigate("/dashboard");
    }
  }, [authStatus]);

  return (
    <div className="flex items-center justify-center h-screen bg-secondary">
      <Card className="p-3">
        <CardHeader>
          <CardTitle className="text-4xl mb-2">Register to Orca</CardTitle>
          <CardDescription>Create an account and get anonymous</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            name="first_name"
            className="mb-5"
            placeholder="First Name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Input
            name="last_name"
            className="mb-5"
            placeholder="Last Name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
          />
          <Input
            name="email"
            className="mb-5"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <Input
            name="password"
            className="mb-5"
            placeholder="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
          />

          <Button onClick={handleSignup}>Register</Button>
        </CardContent>
        <CardFooter>
          <p>
            Already have an account ?
            <Link className="text-blue-600" to="/login">
              {" "}
              Login
            </Link>{" "}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Signup;
