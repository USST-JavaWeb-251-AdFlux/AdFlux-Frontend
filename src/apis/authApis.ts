import { request } from './request';

export const authRegisterApi = (body: {
    username: string;
    userPassword: string;
    checkPassword: string;
    phone: string;
    email: string;
}) => {
    return request('/user/register', { method: 'POST', body });
};

export const authLoginApi = (body: { username: string; userPassword: string }) => {
    return request('/user/login', { method: 'POST', body });
};
