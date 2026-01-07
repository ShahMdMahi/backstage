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

export function NewUserCreatedEmailTemplate({
  name,
  email,
  password,
  createdByName,
  dashboardUrl,
}: {
  name: string;
  email: string;
  password: string;
  createdByName: string;
  dashboardUrl: string;
}) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#3b82f6",
              success: "#10b981",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
            <Section className="bg-success text-white text-center py-8">
              <Text className="text-2xl font-bold">
                Your Account Has Been Created!
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {name},</Text>
              <Text className="mb-4">
                An account has been created for you by {createdByName} on the
                Backstage Dashboard.
              </Text>
              <Text className="mb-2">
                <strong>Email:</strong> {email}
              </Text>
              <Text className="mb-4">
                <strong>Temporary Password:</strong> {password}
              </Text>
              <Text className="mb-6 text-sm text-gray-600">
                Please change your password after your first login for security
                purposes.
              </Text>
              <Button
                className="bg-success px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                Login to Dashboard
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you did not expect this email, please contact our support
                team immediately.
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

export default NewUserCreatedEmailTemplate;
