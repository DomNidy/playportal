import axios from "axios";
import dotenv from "dotenv";
import { NextRequest, NextResponse } from "next/server";
dotenv.config();
// TODO: https://developer.spotify.com/documentation/web-api/howtos/web-app-profile

// Get environment variables
const { CLIENT_ID, CLIENT_SECRET } = process.env;

export async function get(req: NextRequest, res: NextResponse) {}
