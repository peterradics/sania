# build project
npm run build
#copy package to build folder
cp package.json package-lock.json build/

ssh -i ~/office/hetzner/sania.key root@188.245.235.148 "rm -rf ~/account/*"

scp -r -i ~/office/hetzner/sania.key ./build root@188.245.235.148:~/account/
scp -i ~/office/hetzner/sania.key Dockerfile root@188.245.235.148:~/account/

ssh -i ~/office/hetzner/sania.key root@188.245.235.148 "cd account;podman build -t account .;podman kill acc;podman container rm acc;podman run -d -p 3200:3200 --name acc account"

# podman build -t sania .
# podman save equitrack | gzip > equitrack.tar.gz
# scp -i ~/office/aws/equ.pem equitrack.tar.gz root@188.245.235.148:~/
# ssh -i ~/office/aws/equ.pem ubuntu@3.64.211.34 "docker kill equ;docker container rm equ;docker load -i equitrack.tar.gz;docker run -d -p 3300:3300 --name equ equitrack"
# rm equitrack.tar.gz
