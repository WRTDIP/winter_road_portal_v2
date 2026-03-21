import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import LoginForm from "../../components/Login/Login";
import { Typography } from '@mui/material';

function Dashboard() {
    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Login" />
      <LoginForm />
      <Typography 
        variant="body1" 
        sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
        onClick={() => window.location.href = '/register'}
      >
        Dashboard
      </Typography>
      </Container>
    );
}

export default Dashboard;