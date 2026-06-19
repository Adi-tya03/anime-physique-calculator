import { useState } from "react";

import axios from "axios";

import {

Link,

useNavigate

} from "react-router-dom";


export default function Login() {

const navigate = useNavigate();


const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [loading, setLoading] = useState(false);

const [error, setError] = useState("");



const handleLogin = async (e) => {

e.preventDefault();

setLoading(true);

setError("");

try {

const formData = new FormData();

formData.append("username", email);

formData.append("password", password);


const response = await axios.post(

"https://anime-physique-calculator.onrender.com/auth/login",

formData

);


localStorage.setItem(

"token",

response.data.access_token

);


navigate("/");

}

catch (err) {

setError(

err.response?.data?.detail ||

"Login Failed"

);

}

finally {

setLoading(false);

}

};



return (

<div

className="

min-h-screen

bg-[#050816]

flex

justify-center

items-center

px-6

"

>


<div

className="

w-full

max-w-md

bg-white/5

backdrop-blur-xl

border

border-white/10

rounded-3xl

p-10

shadow-2xl

shadow-purple-500/20

"

>


<h1

className="

text-white

text-4xl

font-bold

text-center

mb-8

"

>

Login

</h1>



<form

onSubmit={handleLogin}

className="space-y-5"

>


<input

type="email"

placeholder="Email"

value={email}

onChange={(e)=>setEmail(e.target.value)}

className="

w-full

p-4

rounded-2xl

bg-white/10

text-white

outline-none

"

required

/>




<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

className="

w-full

p-4

rounded-2xl

bg-white/10

text-white

outline-none

"

required

/>




{

error &&

<p className="text-red-400 text-center">

{error}

</p>

}




<button

type="submit"

disabled={loading}

className="

w-full

bg-purple-600

hover:bg-purple-500

rounded-2xl

py-4

text-white

font-semibold

transition

duration-300

"

>

{

loading

?

"Logging In..."

:

"Login"

}

</button>



<div className="text-center">

<p className="text-gray-400">

New User?{" "}

<Link

to="/register"

className="

text-purple-400

hover:text-purple-300

"

>

Register

</Link>

</p>

</div>


</form>



</div>



</div>

)

}