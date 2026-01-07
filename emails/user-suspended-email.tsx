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

export function UserSuspendedEmailTemplate({
  name,
  email,
  dashboardUrl,
}: {
  name: string;
  email: string;
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
              danger: "#ef4444",
            },
          },
        },
      }}
    >
      <Html>
        <Head />
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto max-w-lg bg-white shadow-lg rounded-lg overflow-hidden">
            <Section className="bg-danger text-white text-center py-8">
              <Text className="text-2xl font-bold">Account Suspended</Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi {name},</Text>
              <Text className="mb-4">
                Your account ({email}) has been suspended and you no longer have
                access to the Backstage Dashboard.
              </Text>
              <Text className="mb-6">
                If you believe this is a mistake or have questions about your
                account suspension, please contact our support team immediately.
              </Text>
              <Button
                className="bg-brand px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={dashboardUrl}
              >
                Contact Support
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                We&apos;re here to help. Reach out to our support team if you
                need further assistance.
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

export default UserSuspendedEmailTemplate;
