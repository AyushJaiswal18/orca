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

const Login = () => {
  const { authStatus, setauthStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post("/users/login", {
        email: formData.email,
        password: formData.password,
      });
      setauthStatus(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Some error has occured.",
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
      <Card className="p-5">
        <CardHeader>
          <CardTitle className="text-4xl mb-2">Login to Orca</CardTitle>
          <CardDescription>
            Access your account and get anonymous
          </CardDescription>
        </CardHeader>
        <CardContent>
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

          <Button onClick={handleLogin}>Login</Button>
        </CardContent>
        <CardFooter>
          <p>
            Not have an account ?
            <Link className="text-blue-600" to="/signup">
              {" "}
              Register
            </Link>{" "}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
