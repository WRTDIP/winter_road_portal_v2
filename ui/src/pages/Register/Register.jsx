import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import RegisterForm from "../../components/Login/RegisterForm";
import { Typography } from '@mui/material';

function Register() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Register" />
      <RegisterForm />
      <Typography 
        variant="body1" 
        sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => window.location.href = '/login'}
      >
        Login
      </Typography>
      </Container>
    );
}

export default Register;