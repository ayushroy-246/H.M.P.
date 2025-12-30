import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const Login = ({ role }) => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    username: "",
    mobile: "",
    password: "",
    pin: ""
  })

  const loginConfig = {
    student: {
      title: "Student Login",
      subtitle: "Access your hostel portal",
      fields: [
        { name: "username", type: "text", label: "Username", placeholder: "Enter your username" },
        { name: "password", type: "password", label: "Password", placeholder: "Enter your password" }
      ],
      buttonColor: "bg-green-600 hover:bg-green-700",
      dashboardPath: "/student/dashboard"
    },
    staff: {
      title: "Staff Login",
      subtitle: "Access your work portal",
      fields: [
        { name: "mobile", type: "tel", label: "Mobile Number", placeholder: "10-digit mobile number" },
        { name: "pin", type: "password", label: "PIN", placeholder: "6-digit PIN" }
      ],
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      dashboardPath: "/staff/dashboard"
    },
    warden: {
      title: "Warden Login",
      subtitle: "Manage your hostel",
      fields: [
        { name: "username", type: "text", label: "Username", placeholder: "Enter your username" },
        { name: "password", type: "password", label: "Password", placeholder: "Enter your password" }
      ],
      buttonColor: "bg-purple-600 hover:bg-purple-700",
      dashboardPath: "/warden/dashboard"
    },
    admin: {
      title: "Admin Login",
      subtitle: "System administration portal",
      fields: [
        { name: "username", type: "text", label: "Username", placeholder: "Enter your username" },
        { name: "password", type: "password", label: "Password", placeholder: "Enter your password" }
      ],
      buttonColor: "bg-red-600 hover:bg-red-700",
      dashboardPath: "/admin/dashboard"
    }
  }

  const config = loginConfig[role]

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Login attempt:", role, formData)
    navigate(config.dashboardPath)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4 dark:text-black"
          onClick={() => navigate("/")}
        >
          ← Back to Home
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{config.title}</CardTitle>
            <CardDescription>{config.subtitle}</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}

              <div className="text-right">
                <Button variant="link" type="button">
                  Forgot password?
                </Button>
              </div>

              <Button
                type="submit"
                className={`w-full ${config.buttonColor}`}
              >
                Login
              </Button>
            </form>
          </CardContent>

          <CardFooter className="justify-center text-sm text-muted-foreground">
            Need help? Contact your hostel administrator
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default Login
