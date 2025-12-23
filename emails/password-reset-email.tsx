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

export function PasswordResetEmailTemplate({
  email,
  expiresIn,
  resetUrl,
}: {
  email: string;
  expiresIn: string;
  resetUrl: string;
}) {
  return (
    <Tailwind
      config={{
        presets: [pixelBasedPreset],
        theme: {
          extend: {
            colors: {
              brand: "#ef4444",
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
              <Text className="text-2xl font-bold">Reset Your Password</Text>
            </Section>
            <Section className="p-8">
              <Text className="text-lg mb-4">Hi there,</Text>
              <Text className="mb-4">
                We&apos;ve sent this password reset email to {email}. We
                received a request to reset your password for your backstage
                dashboard account. If you made this request, click the button
                below to set a new password.
              </Text>
              <Text className="mb-6">
                This reset link will expire in {expiresIn}. If you did not
                request a password reset, you can safely ignore this email.
              </Text>
              <Button
                className="bg-brand px-6 py-3 font-semibold leading-4 text-white rounded-md"
                href={resetUrl}
              >
                Reset Password
              </Button>
              <Hr className="my-6" />
              <Text className="text-sm text-gray-600">
                If the button doesn&apos;t work, copy and paste this link into
                your browser:
              </Text>
              <Text className="text-sm text-gray-600 mt-2">{resetUrl}</Text>
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

export default PasswordResetEmailTemplate;
