# MAAS Site Enrollment

Enrolling MAAS Sites is the core feature of MAAS Site Manager. Once enrolled, sites will use MAAS Site Manager as its upstream image source, so image management can be done once in a central place. Additionally, MAAS Site Manager will monitor the status of each site and its machines.

## Enroll a site with MAAS Site Manager

Follow the steps below to enroll a MAAS site with MAAS Site Manager.

### Generate an enrollment token

To enroll a site with MAAS Site Manager, you will first need to generate an enrollment token. To do so, click Settings on the left-hand side in the UI, then click Tokens. On this page, generate a token and copy it to your clipboard.

### Enroll MAAS with MAAS Site Manager

Next, we will enroll MAAS with MAAS Site Manager using the MAAS CLI. First, create a `yaml` file with metadata about the site. Supported structure and parameters are shown here:

```yaml
metadata:
    coordinates:
        latitude: 27.9881
        longitude: 86.9250
    country: US # must be a valid 2-letter country code
    city: City
    state: State
    address: "123 Address St."
    postal_code: "12345"
    timezone: UTC # must be a valid tz database timezone
    note: "This MAAS has Super Cow Powers."
```

If you're using a MAAS installed via snap, place this file in a directory where the snap has permissions to read it, such as `/var/snap/maas/common/`

Then, enroll MAAS with MAAS Site Manager:

```bash
# yes, enrol is spelled differently here.
sudo maas msm enrol $TOKEN metadata.yaml
```

Next, in the MAAS Site Manager UI, click Settings, then Requests. Here, you will see your pending Site. Select it, then click Accept.

Now your MAAS Site has been enrolled with MAAS Site Manager. This means:

- Any images you select for download in MAAS Site Manager will automatically be downloaded by this MAAS
- You may monitor the heath of this MAAS's machines in the MAAS Site Manager Sites page.
