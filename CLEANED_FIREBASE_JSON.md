# Cleaned Firebase Service Account JSON

## Instructions
Copy the JSON below and paste it into your Netlify environment variable `GOOGLE_APPLICATION_CREDENTIALS_JSON`.

## NEW Firebase Admin SDK JSON (Ready to Use)

```json
{"type":"service_account","project_id":"lazerengraving-deb21","private_key_id":"d0394c81952accb8276fd1415fd804db5fa31390","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDEkKKI61L/OfQs\nYALBklsDcKvgUrDM0sL+mwxLepZ092ysJdPSpsg28pH9oXWJ7aLFchXgMqH5nNvV\n5ToyECcC6JFlFeYOmsB1yp3u+/AZPsb/D713tdvu1Gme9yD+AOnQmMMjDQ5P6pUf\nh2vBIE8ZD3ct0obN1mftkAZEBoVhLMHey8LS2YLb4MfJKdWB9tt47OU765ZTqSCj\ngBKKzNFPj+DQxY8cdx5rBVGTdDrGUiDb7TP33wuSJwvniCRj/amQH0gMTaQoogTd\nZMenYc5MBQKLNub0DvuGNzKVJ/twEl5dj8f4tQadMuRDpmHNagihzkxWsAb9urhX\nLBXfdEBlAgMBAAECggEAXGafORziOZ8tJJUHhqY9iXr0GPHWMZqb1mLdXzfjtV1A\nJRZtIjeLo6TYsvEs1ycx3n4YQXmbwcKWZtCoUDNem1PnUSz/pfriIR0bq+WbwspL\nckgcaUNAfV81vWfvhue4AfpltLrk8PVVn2oh4bnF5QJrpEs0WluBJGARSfYEyh4U\nmxy5BJciLJrzgI43uXOpzDjUWsL22hW+OIBt8UR2AK+EkhrfhfNukaJysbLpDRPl\nW5gZHnTR53aDJAn+r8Dx1razr+7vJbpBDzEwewAZD+6Ch/wKoQeri+YFMAabB1hM\nA9aXUH/i91p7YfyHDqe4E1ressT5lP23pZzg4hPi2wKBgQDlP3gXrjgSMQgrUx4C\nke+cmUqibMAe7iDc45ZVsDNAA6mTOOJzio1i1B+3Y5MAbgSNlrChKiX+dVE2SMhR\nF1Yb36BOmrSksmqRsu1WhHXFspduqQ1ufwr9RMMuezkgNCmiVYy7/fMQ0+K2p+Bc\n0w5yXaX2bSS4TnszvS3ydLFyrwKBgQDbgMxteobAXQZr5S2FgKnBcbzJ+CeRdq/R\n/QIzqwLfqvl3mx/M6HIytTsuSOlrTjpeNpyqJi8UJgjnoHGAMlHxQBhQPtD3i6TV\n/kDAHTIsyaTuzK5P4nJ+ld3J/c55IWpKqVKIGJiS+FJHTm+rUK4v8c8qBPxDCfIU\nPVoq/M0TKwKBgFbj35jaJ9Z9TyNctZszxSYN1AQMRCV1DG+ss2Z3CnXQ7Y0nmm1A\nrqYu0Hap/yXCjWc9HmV3nD7+KHHy1DooJjMaZ6BjcuSZ21qt/tc0DY+JSWxgFv8y\nl++3CGOtwNE79CvbUSRP9LkEFoI0zw1f0bH3XNgyNiDFXl0V7zxejoNxAoGBAI6C\nZ7boZtY7TzD7wPs9Fnl+U3i5QU9CxFHMNwK+k4YNphuOPi419/aODVc2hT1is6h5\nQmuBkO0+6Gchlq8JfIPp/h8TOW6OXj2E7hsMmYfUft1/S+iXd4hR2oYK32NrW2wP\n1IKBnYVF7X1YIk4SepSsJLj+NZ18touHbaQdLzOzAoGAEPM68aNXyEYy2hRXy3Ii\n3EFAlJZOga6ueqHvdtdXX9mORwLcSm9DhO7OELK5PLu8YCb+78CrXMOwekPBJDT1\nSFutqlXzMCrBV0KzgM+LbE2fVpDEvI4834c49VdsTTowgFcGvUx0ydce5JPUX0Pr\nTcG52NXSNOtphJHKFRVHuMM=\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@lazerengraving-deb21.iam.gserviceaccount.com","client_id":"105397268460086482027","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40lazerengraving-deb21.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

## Steps to Apply

1. **Copy the entire JSON** from the code block above (click the copy button)
2. **Go to Netlify Dashboard** → Your Site → Site Settings → Environment Variables
3. **Find** `GOOGLE_APPLICATION_CREDENTIALS_JSON` 
4. **Replace** the entire value with the cleaned JSON
5. **Save** the changes
6. **Wait** for Netlify to redeploy (1-2 minutes)
7. **Test** gallery save functionality

## What Was Fixed

- ✅ Removed extra spaces from `-----BEGIN PRIVATE KEY-----`
- ✅ Removed extra spaces from `-----END PRIVATE KEY-----`
- ✅ Cleaned all extra spaces from private key content lines
- ✅ Fixed `token_uri` field (removed spaces)
- ✅ Fixed `client_x509_cert_url` field (removed spaces)
- ✅ Preserved all `\n` newline characters in private key

## Expected Result

After applying this cleaned JSON, the Firebase Admin SDK should initialize properly and gallery saves should work without 503 errors.