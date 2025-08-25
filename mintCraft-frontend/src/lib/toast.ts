import { toast } from "react-hot-toast"

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: "top-right",
      style: {
        background: "#00ff00",
        color: "#000",
        fontWeight: "bold",
        border: "4px solid #000",
        borderRadius: "0px",
        boxShadow: "4px 4px 0px #000",
      },
    })
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 5000,
      position: "top-right",
      style: {
        background: "#ff0000",
        color: "#fff",
        fontWeight: "bold",
        border: "4px solid #000",
        borderRadius: "0px",
        boxShadow: "4px 4px 0px #000",
      },
    })
  },

  loading: (message: string) => {
    return toast.loading(message, {
      position: "top-right",
      style: {
        background: "#ffff00",
        color: "#000",
        fontWeight: "bold",
        border: "4px solid #000",
        borderRadius: "0px",
        boxShadow: "4px 4px 0px #000",
      },
    })
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId)
  },

  promise: (promise: Promise<any>, messages: { loading: string; success: string; error: string }) => {
    return toast.promise(promise, messages, {
      position: "top-right",
      style: {
        fontWeight: "bold",
        border: "4px solid #000",
        borderRadius: "0px",
        boxShadow: "4px 4px 0px #000",
      },
      success: {
        style: {
          background: "#00ff00",
          color: "#000",
        },
      },
      error: {
        style: {
          background: "#ff0000",
          color: "#fff",
        },
      },
      loading: {
        style: {
          background: "#ffff00",
          color: "#000",
        },
      },
    })
  },
}
