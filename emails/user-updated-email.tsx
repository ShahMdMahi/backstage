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

export function UserUpdatedEmailTemplate({
  name,
  email,
  updatedByName,
  dashboardUrl,
}: {
  name: string;
  email: string;
  updatedByName: string;
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
              info: "#0ea5e9",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
            <Section className="bg-info text-white text-center py-8">
              <Text className="text-2xl font-bold">
                Your Account Has Been Updated
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {name},</Text>
              <Text className="mb-4">
                Your account ({email}) has been updated by {updatedByName} on
                the Backstage Dashboard.
              </Text>
              <Text className="mb-6">
                Please review your account details and contact our support team
                if you have any questions about the changes made.
              </Text>
              <Button
                className="bg-info px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                View Your Account
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you did not expect this update, please contact our support
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

export default UserUpdatedEmailTemplate;
