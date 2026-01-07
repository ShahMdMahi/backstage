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

export function UpdatedSystemAccessEmailTemplate({
  userName,
  userEmail,
  updatedByName,
  dashboardUrl,
}: {
  userName: string;
  userEmail: string;
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
              <Text className="text-2xl font-bold">System Access Updated</Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {userName},</Text>
              <Text className="mb-4">
                Your system access has been updated by {updatedByName}. Your
                account ({userEmail}) now has modified permissions on the
                Backstage Dashboard.
              </Text>
              <Text className="mb-6">
                Please review your access levels and contact our support team if
                you have any questions about your updated permissions.
              </Text>
              <Button
                className="bg-info px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                View Dashboard
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you have any questions about your updated permissions, please
                contact our support team.
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

export default UpdatedSystemAccessEmailTemplate;
