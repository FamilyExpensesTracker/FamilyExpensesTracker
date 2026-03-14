<?php
// lib/Mailer.php - Email sending functionality

class Mailer {
    private $config;

    public function __construct($config) {
        $this->config = $config;
    }

    public function sendOTP($email, $otp) {
        $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL);
        if (!$safeEmail) {
            return false;
        }

        $subject = 'Your OTP Code for Family Expense Tracker';
        $body = $this->generateOTPEmail($otp);
        return $this->sendEmail($safeEmail, $subject, $body);
    }

    private function generateOTPEmail($otp) {
        $expiry = (int)$this->config['OTP_EXPIRY_MINUTES'];

        return '
        <!DOCTYPE html>
        <html>
        <head>
            <title>Your OTP Code</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; }
                .container { background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .title { color: #333; font-size: 24px; margin-bottom: 20px; }
                .otp-container { text-align: center; margin: 30px 0; }
                .otp-code { font-size: 42px; font-weight: bold; color: #007bff; letter-spacing: 5px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block; min-width: 200px; }
                .expiry { color: #666; font-size: 14px; margin-top: 10px; }
                .instructions { color: #666; line-height: 1.6; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 class="title">Family Expense Tracker</h1>
                </div>
                <div class="otp-container">
                    <div class="otp-code">' . htmlspecialchars($otp, ENT_QUOTES, 'UTF-8') . '</div>
                    <div class="expiry">This code expires in ' . $expiry . ' minutes</div>
                </div>
                <div class="instructions">
                    <p>Your one-time password (OTP) for accessing your Family Expense Tracker account is shown above.</p>
                    <p>If you did not request this code, you can ignore this email.</p>
                </div>
                <div class="footer">
                    <p>This is an automated message. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>';
    }

    private function sendEmail($to, $subject, $body) {
        $headers = $this->generateHeaders();

        if (!empty($this->config['USE_SMTP']) && !empty($this->config['SMTP_HOST'])) {
            return $this->sendSMTP($to, $subject, $body, $headers);
        }

        return $this->sendPHP($to, $subject, $body, $headers);
    }

    private function generateHeaders() {
        $fromAddress = preg_replace('/[\r\n]+/', '', (string)$this->config['MAIL_FROM']);
        $fromName = preg_replace('/[\r\n]+/', '', (string)($this->config['MAIL_FROM_NAME'] ?? 'Family Expense Tracker'));

        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $fromName . ' <' . $fromAddress . '>',
        ];

        if (!empty($this->config['MAIL_REPLY_TO'])) {
            $replyTo = preg_replace('/[\r\n]+/', '', (string)$this->config['MAIL_REPLY_TO']);
            $headers[] = 'Reply-To: ' . $replyTo;
        }

        return implode("\r\n", $headers);
    }

    private function sendPHP($to, $subject, $body, $headers) {
        $safeSubject = preg_replace('/[\r\n]+/', '', (string)$subject);
        return mail($to, $safeSubject, $body, $headers);
    }

    private function sendSMTP($to, $subject, $body, $headers) {
        // SMTP transport is not yet implemented. Fall back to PHP mail().
        // Set USE_SMTP = false in config to suppress this warning.
        error_log('[FamilyExpenseTracker] WARNING: SMTP configured (host: '
            . ($this->config['SMTP_HOST'] ?? '') . ') but not implemented. Using PHP mail() as fallback.');
        return $this->sendPHP($to, $subject, $body, $headers);
    }
}
?>