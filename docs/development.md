# MAAS Site Manager Development

To test code changes in your development environment, you can build and deploy a new "rock" (container image) without waiting for a new release.

You can either clone the repository inside the VM (requires SSH key setup), or transfer it from your local machine:

```bash
# Option 1: Transfer from local machine
multipass transfer -r ./maas-site-manager charm-dev-vm:/home/ubuntu/

# Option 2: Clone inside VM (requires SSH key with repo access)
git clone git+ssh://git.launchpad.net/~maas-committers/maas-site-manager
```

Navigate to the source directory and build the rock:

```bash
cd maas-site-manager
rockcraft pack
```

This will produce a file like `maas-site-manager_0.1_amd64.rock`.

Upload the rock to the local MicroK8s registry (accessible on port 32000):

```bash
rockcraft.skopeo --insecure-policy copy --dest-tls-verify=false \
  oci-archive:maas-site-manager_0.1_amd64.rock \
  docker://localhost:32000/maas-site-manager:0.1
```

Update the MAAS Site Manager charm to use the new image:

```bash
juju refresh maas-site-manager-k8s --resource site-manager-image=localhost:32000/maas-site-manager:0.1
```

Also update the temporal-worker charm (which uses the same rock):

```bash
juju switch temporal-worker
juju refresh temporal-worker-k8s --resource temporal-worker-image=localhost:32000/maas-site-manager:0.1
```

After refreshing, check the status with `juju status` and wait for the applications to become `active/idle`. The changes should be visible in the MSM webpage.

