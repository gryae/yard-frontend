// import axios from 'axios'

// const instance = axios.create({
//   baseURL: 'http://192.168.1.22:3001', // ganti sesuai backend
// })

// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// })

// export default instance
// // import axios from 'axios'

// // const instance = axios.create({
// //   baseURL: '/api', // 🔥 pakai relative path
// // })

// // instance.interceptors.request.use((config) => {
// //   if (typeof window !== 'undefined') {
// //     const token = localStorage.getItem('token')
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`
// //     }
// //   }
// //   return config
// // })

// // export default instance




import Axios from 'axios'

const axios = Axios.create({
   baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  //baseURL: 'http://localhost:3001', // ganti sesuai backend

})

// ✅ REQUEST INTERCEPTOR (optional kalau mau auto inject token)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ✅ RESPONSE INTERCEPTOR (INI YANG LO TANYA)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      alert('You are not allowed to access this feature.')
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default axios