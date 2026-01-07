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

export function UnsuspendedSystemAccessEmailTemplate({
  userName,
  userEmail,
  dashboardUrl,
}: {
  userName: string;
  userEmail: string;
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
                System Access Restored!
              </Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {userName},</Text>
              <Text className="mb-4">
                Great news! Your system access has been restored. Your account (
                {userEmail}) now has elevated permissions on the Backstage
                Dashboard again.
              </Text>
              <Text className="mb-6">
                You can now access restricted features and manage system
                resources according to your assigned access levels.
              </Text>
              <Button
                className="bg-success px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                Access Dashboard
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If you have any questions, please don&apos;t hesitate to contact
                our support team.
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

export default UnsuspendedSystemAccessEmailTemplate;
