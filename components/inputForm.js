import {useState, forwardRef} from 'react';

import PropTypes from 'prop-types';
import { IMaskInput } from 'react-imask';
import { Container } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import {GET_DISTANCE_BETWEEN_TWO_ZIP} from "../externalApis/zip.js"

const TextMaskCustom = forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="000-0000"
      definitions={{
        '#': /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

TextMaskCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const InputForm = () =>  {
  const [values, setValues] = useState({
    textmask: '-',
    fromZip: '',
    toZip: '',
    numberformat: '1320',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [calculatedDistance, setCalculatedDistance] = useState('');

  const handleSubmit = async() => {
	setLoading(true);
  setSuccessMessage("");

  const payload = {
    FromZip: Number(values.fromZip.replace("-",'')),
    ToZip: Number(values.toZip.replace("-",''))
  }
	const options = {
      method: "POST",
      url: GET_DISTANCE_BETWEEN_TWO_ZIP,
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    }
    
    try {
      setError('');
      setSuccess('');
      const response = await fetch(GET_DISTANCE_BETWEEN_TWO_ZIP, options);
      let responseJson = await response.json()
      const {status, resultData} = responseJson.result;
      const validationErrors = responseJson.errors

      if (status){
        setSuccess("Distance Calculated successfully");
        setSuccessMessage(`${resultData}`);
        setCalculatedDistance(resultData);
      }
      else{
        if(validationErrors){
          let validationErrorsArray = Object.keys(validationErrors).map((key) => validationErrors[key]);
          var errorMessage = '';
          validationErrorsArray.forEach(error => {
            errorMessage += error + ', ';
          });
          setError(errorMessage.replace(/,\s*$/, "")); // replace comma before setting the error
        }
        else{
          setError(responseJson.error.message);
        }
      }
    } catch (error) {
      setError(error.message);
    }
	setLoading(false);
  };

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <Container sx={{margin: "400px 40px 40px 600px"}} >
		  {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <FormControl variant="standard" sx={{display: "block", marginBottom:"20px"}}>
        <InputLabel htmlFor="formatted-text-mask-input">From ZIP</InputLabel>
        <Input
          value={values.fromZip}
          onChange={handleChange}
          name="fromZip"
          id="from-zip"
          inputComponent={TextMaskCustom}
		  />
      </FormControl>

	    <FormControl variant="standard" sx={{display: "block", marginBottom:"20px"}}>
        <InputLabel htmlFor="formatted-text-mask-input">To ZIP</InputLabel>
        <Input
          value={values.toZip}
          onChange={handleChange}
          id="to-zip"
          name="toZip"
          inputComponent={TextMaskCustom}
        />
      </FormControl>
	  <FormControl variant="standard">
		<LoadingButton 
			variant='contained' 
			onClick={handleSubmit}
			loading={loading}	
      loadingindicator="Please wait..."	
		> Submit
    </LoadingButton>
      </FormControl>
      {calculatedDistance &&
      <Typography variant="subtitle2" gutterBottom mt={3}>{successMessage}</Typography>
      }
    </Container>
  );
}
export default InputForm;
