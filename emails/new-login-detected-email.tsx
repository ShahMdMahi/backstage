import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
  Tailwind,
  pixelBasedPreset,
} from "@react-email/components";

export function NewLoginDetectedEmailTemplate({
  email,
  loginTime,
  location,
  device,
  dashboardUrl,
}: {
  email: string;
  loginTime: string;
  location: string;
  device: string;
  dashboardUrl: string;
}) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#f59e0b",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
            <Section className="bg-brand text-white text-center py-8">
              <Text className="text-2xl font-bold">New Login Detected</Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi there,</Text>
              <Text className="mb-4">
                We&apos;ve sent this email to {email} because we detected a new
                login to your backstage dashboard account.
              </Text>
              <Text className="mb-4">
                <strong>Login Details:</strong>
                <br />
                Time: {loginTime}
                <br />
                Location: {location}
                <br />
                Device: {device}
              </Text>
              <Text className="mb-6">
                If this was you, no action is needed. If you don&apos;t
                recognize this activity, please secure your account immediately
                by resetting your password.
              </Text>
              <Button
                className="bg-brand px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                Go to Dashboard
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you have any concerns, please contact our support team.
              </Text>
              <Text className="text-sm text-gray-600 mt-4">
                Best regards,
                <br />
                The Backstage Team
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

export default NewLoginDetectedEmailTemplate;
