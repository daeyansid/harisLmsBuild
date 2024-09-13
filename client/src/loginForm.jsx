// LoginForm.jsx
import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useAuth } from './AuthProvider';
import "./App.css";
import logo from './assets/logo.png';
import bg from './assets/bg-pic.jpg';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); // Use the login function from context

    const roleToRouteMap = {
        superAdmin: 'super-admin/dashboard',
        branchAdmin: 'branch-admin/dashboard',
        teacher: 'teacher/dashboard',
        guardian: 'guardian/dashboard',
        student: 'student/dashboard'
    };

    const validateForm = () => {
        if (!email || !password) {
            Swal.fire({
                title: 'Error!',
                text: 'Please enter both email and password.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await axios.post('https://lms.bluejaysschool.com/api/auth/login', {
                email,
                password,
            });

            const { status, data } = response;

            if (status === 200) {
                const { token, user, branchAdmin, branch } = data.data;
                const role = user.userRole;
                const redirectRoute = roleToRouteMap[role];

                login({
                    token,
                    userRole: role,
                    userId: user._id,
                    username: user.username,
                    adminName: branchAdmin?.fullName || '',
                    adminEmail: user.email,
                    branchId: branch?._id || '',
                    branchTypeAdmin: branch?.branchName || ''
                });

                Swal.fire({
                    title: 'Success!',
                    text: 'You have logged in successfully.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate(`/${redirectRoute}`);
                });

            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'An unexpected error occurred.',
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            }

        } catch (error) {
            handleLoginError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoginError = (error) => {
        if (error.response) {
            const { status, data } = error.response;

            if (status === 400) {
                Swal.fire({
                    title: 'Error!',
                    text: data.message || 'Invalid credentials.',
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            } else if (status === 500) {
                Swal.fire({
                    title: 'Error!',
                    text: 'A server error occurred. Please try again later.',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'An unexpected error occurred.',
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            }
        } else {
            Swal.fire({
                title: 'Error!',
                text: 'Network error or unexpected issue. Please check your connection.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        }

        console.error('There was an error logging in!', error);
    };

    return (
        <div
            className="bg-cover bg-center bg-custom-white bg-no-repeat min-h-screen flex items-center justify-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 max-w-lg mx-auto">
                <div className="text-center mb-6">
                    <img
                        src={logo}
                        className="mx-auto w-20 h-20"
                        alt="Logo"
                    />
                    <h1 className="whitespace-nowrap text-3xl font-bold text-hover-color mt-4">
                        BLUE JAYS SCHOOL SYSTEM
                    </h1>
                    <p className="text-custom-shadow text-2xl font-bold">Education is our passion</p>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            className="shadow appearance-none border rounded w-full py-4 px-3 text-gray-700 bg-text-field leading-tight focus:outline-none focus:shadow-outline"
                            id="email"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            className="shadow appearance-none border rounded w-full py-4 px-3 text-gray-700 bg-text-field leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <div className="flex items-center justify-end">
                            <a
                                className="cursor-no-drop mt-6 inline-block align-baseline font-bold text-sm text-hover-color hover:text-hover-color"
                                href="#"
                            >
                                Forgot Password?
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center justify-center">
                        <button
                            className="bg-hover-color hover:bg-indigo-900 w-96 text-white font-bold py-2 px-4 border-rounded rounded-md focus:outline-none focus:shadow-outline"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
