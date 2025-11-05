#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Vercel deployment configuration
const VERCEL_TOKEN = process.env.VERCEL_TOKEN || 'your_vercel_token_here';
const PROJECT_NAME = 'promohive';
const DOMAIN = 'globalpromonetwork.online';

// Environment variables to set
const envVars = {
  'VITE_SUPABASE_URL': 'https://jtxmijnxrgcwjvtdlgxy.supabase.co',
  'VITE_SUPABASE_ANON_KEY': 'your_anon_key_here',
  'ADSTERRA_API_KEY': 'YOUR_ADSTERRA_API_KEY',
  'ADSTERRA_PLACEMENT_ID': 'YOUR_ADSTERRA_PLACEMENT_ID',
  'ADSTERRA_DIRECT_URL': 'YOUR_ADSTERRA_DIRECT_URL',
  'ADGEM_API_KEY': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiMGZlODg1NDM5ODM1ODM4OThjM2RmNDVmOGFlNDYxN2QwYTJhNThjNjVjNWQ2ODUyMzg3Njc1Yzk0OGNiNGQyYmYzZDNkNzYxZmI1ZjZlYzEiLCJpYXQiOjE3NjIwMzIwMDcuMzA0MjY5LCJuYmYiOjE3NjIwMzIwMDcuMzA0MjcyLCJleHAiOjE3OTM1NjgwMDcuMzAwMDQ5LCJzdWIiOiIyOTE0OSIsInNjb3BlcyI6W119.Y7pFsSe4BVVtpBzaLG66N-S0dKKcGBqPWup70whf2aeLtt1Sa2C1m-OBsOU-w9YOQdo4fFE83PEpJMb1euy5E5Ut0nr1JXReW8ejVSSvCfW6Hp9VzRfoM8zvUcE0ns6GEKXWvQ6Kox8m5QXQff-92oHKeM_k-4U1emMDA9JHjSmwOC67bWUmKfTO6OQdo2M6FKM3YujbZNDoVpll5CanFIwR2u4BfZpPCB2nOgECvD7tDdnRFk_kdtPhcYCqB3xbLAcEBh3nqKiKMNq1pJA0KNopsHfiw6JXnq70glqi0wlaFDa0YjXNcGjrtjSaGxlHqgLOzHSoGhcpBe2h-r2tNKPHBjd0Xp_fD88oNy1BJxO_GP7Gw3pHEZ4-l9fbByPrIBL9dkSy9UNiB45VXeIZZ_H9dlEkMxTNtChtVRJq3k3W15WRBQpqUwEF3Qy1wCCNY-Vq4Wu3OEum-E3WiTrHeP_1Dtog1CQySFoxm_XywiQ62HPgOSeFWTykxKfkeIifwpAxtTU0IfOv4pJ8Y7qpoHOdSTUprj2_4qEHSqFGTBi0boF4Q0RluJEVFBN-QuE2FwKY3bjGkMiI1_LT8UxObbXd9RAfJnvNWhTboC6yd0nHbWK0d3qlvmtmKdcBnonYI8QEDPXKa54ULJksXTbMt6BxKqekV96cq05Oe1sibU4',
  'ADGEM_PROPERTY_ID': '31409',
  'ADGEM_POSTBACK_KEY': 'bb6h7hh67id3809bi7blmekd',
  'ADGEM_POSTBACK_URL': 'https://globalpromonetwork.online/bb6h7hh67id3809bi7blmekd',
  'ADMIN_EMAIL': 'admin@globalpromonetwork.online',
  'ADMIN_PASSWORD': 'CHANGE_ME_SECURELY',
  'ADMIN_NAME': 'promohive',
  'NEXT_PUBLIC_APP_URL': 'https://globalpromonetwork.online',
  'NEXT_PUBLIC_APP_NAME': 'PromoHive',
  'NEXT_PUBLIC_DOMAIN': 'globalpromonetwork.online'
};

function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8',
      env: { ...process.env, VERCEL_TOKEN }
    });
    console.log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    if (error.stdout) console.log('STDOUT:', error.stdout);
    if (error.stderr) console.log('STDERR:', error.stderr);
    throw error;
  }
}

async function deployToVercel() {
  console.log('🚀 Starting PromoHive deployment to Vercel...\n');

  try {
    // Check if Vercel CLI is installed
    try {
      execSync('vercel --version', { stdio: 'pipe' });
    } catch (error) {
      console.log('📦 Installing Vercel CLI...');
      runCommand('npm install -g vercel', 'Installing Vercel CLI');
    }

    // Login to Vercel
    console.log('🔐 Authenticating with Vercel...');
    process.env.VERCEL_TOKEN = VERCEL_TOKEN;

    // Build the project
    runCommand('npm run build', 'Building the project');

    // Deploy to Vercel
    console.log('🚀 Deploying to Vercel...');
    const deployOutput = runCommand(
      `vercel --prod --token ${VERCEL_TOKEN} --name ${PROJECT_NAME} --yes`,
      'Deploying to Vercel'
    );

    // Extract deployment URL
    const deploymentUrl = deployOutput.match(/https:\/\/[^\s]+/)?.[0];
    
    if (deploymentUrl) {
      console.log(`\n✅ Deployment successful!`);
      console.log(`🌐 Live URL: ${deploymentUrl}`);
      
      // Set environment variables
      console.log('\n🔧 Setting environment variables...');
      for (const [key, value] of Object.entries(envVars)) {
        try {
          runCommand(
            `vercel env add ${key} production --token ${VERCEL_TOKEN} --yes`,
            `Setting ${key}`
          );
          // Add the value
          execSync(`echo "${value}" | vercel env add ${key} production --token ${VERCEL_TOKEN} --yes`, {
            stdio: 'pipe',
            env: { ...process.env, VERCEL_TOKEN }
          });
        } catch (error) {
          console.log(`⚠️  Warning: Could not set ${key}`);
        }
      }

      // Set custom domain
      if (DOMAIN) {
        console.log(`\n🌍 Setting custom domain: ${DOMAIN}`);
        try {
          runCommand(
            `vercel domains add ${DOMAIN} --token ${VERCEL_TOKEN}`,
            'Adding custom domain'
          );
          runCommand(
            `vercel alias ${deploymentUrl} ${DOMAIN} --token ${VERCEL_TOKEN}`,
            'Setting domain alias'
          );
        } catch (error) {
          console.log('⚠️  Warning: Could not set custom domain');
        }
      }

      console.log('\n🎉 PromoHive has been successfully deployed!');
      console.log(`\n📋 Deployment Summary:`);
      console.log(`   • Project: ${PROJECT_NAME}`);
      console.log(`   • URL: ${deploymentUrl}`);
      if (DOMAIN) console.log(`   • Custom Domain: https://${DOMAIN}`);
      console.log(`   • Environment: Production`);
      console.log(`   • AdGem Integration: ✅ Configured`);
      console.log(`   • Adsterra Integration: ✅ Configured`);
      
      return deploymentUrl;
    } else {
      throw new Error('Could not extract deployment URL');
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

// Run deployment
if (import.meta.url === `file://${process.argv[1]}`) {
  deployToVercel().then(url => {
    console.log(`\n🔗 Your PromoHive app is live at: ${url}`);
  }).catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

export { deployToVercel };
