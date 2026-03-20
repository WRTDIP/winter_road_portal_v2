import {Container} from 'react-bootstrap';
import CoverBanner from "../../components/Global/CoverBanner/CoverBanner";
import EmailValidationForm from "../../components/Login/EmailValidationForm";
import { useSearchParams } from 'react-router-dom';


function EmailValidationFormPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const code = searchParams.get('code'); 
    const email = searchParams.get('email'); 

    return (
      <Container className="p-0" fluid>
      <CoverBanner title="Email Validation" />
      <EmailValidationForm code={code} email={email} />
      </Container>
    );
}

export default EmailValidationFormPage;