import api from "./api";

const feedbackService = {
  submit: async (report) => {
    const response = await api.post("/feedback", report);
    return response.data;
  }
};

export default feedbackService;
