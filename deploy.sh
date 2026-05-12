# build project
npm run build
#copy package to build folder
cp package.json package-lock.json build/

ssh -i ~/office/hetzner/sania.pem root@188.245.235.148 "rm -rf ~/sania/*"

scp -r -i ~/office/hetzner/sania.pem ./build root@188.245.235.148:~/sania/
scp -i ~/office/hetzner/sania.pem Dockerfile root@188.245.235.148:~/sania/

ssh -i ~/office/hetzner/sania.pem root@188.245.235.148 "cd sania;podman build -t sania .;podman kill equ;podman container rm equ;podman run -d -p 3300:3300 --name equ sania"

# podman build -t sania .
# podman save equitrack | gzip > equitrack.tar.gz
# scp -i ~/office/aws/equ.pem equitrack.tar.gz root@188.245.235.148:~/
# ssh -i ~/office/aws/equ.pem ubuntu@3.64.211.34 "docker kill equ;docker container rm equ;docker load -i equitrack.tar.gz;docker run -d -p 3300:3300 --name equ equitrack"
# rm equitrack.tar.gz
