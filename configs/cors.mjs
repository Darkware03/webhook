const corsConfig = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  exposedHeaders: ['page', 'per_page', 'total_rows'],
  optionsSuccessStatus: 204,
};

export default corsConfig;
