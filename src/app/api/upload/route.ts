import { writeFile, mkdir, unlink } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { join, extname, basename } from "path";
import { extractText } from "@/lib/text_utils/extract-text";
import { PDFData } from "@/types";
import { createId } from "@paralleldrive/cuid2";
import { insertDocInDatabase } from "@/lib/text_utils/insert-doc-in-database";
import { getUserInfoFromCookies } from "@/lib/cookie_utils/getUserInfo";
import { createNewChat } from "@/lib/db/queries/chat_queries/createChat";
import { createNewMessage } from "@/lib/db/queries/message_queries/create_message";
import { Message } from "@/types/chat.types";

export async function POST(req: NextRequest) {
    try {

        //gather user info from cookies.
        const userInfo = getUserInfoFromCookies(req);

        const clientURL = req.headers.get("referer");
        if(clientURL === null){
            return NextResponse.json({error:'No referer passed'} , {status:400})
        }
        const clientUrlPath = new URL(clientURL).pathname;



        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        //renaming file to a unique name
        const documentId: string = createId();
        const fileExtension: string = extname(file.name); // .pdf or .txt
        const fileBaseName: string = basename(file.name, fileExtension);
        const uniqueName: string = `${fileBaseName}-${Date.now()}-${Math.round(Math.random() * 1e5)}${fileExtension}`;

        //Converting file data into a Node.js Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const filesize = buffer.length / (1024 * 1024);

        // directory
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure the folder exists
        await mkdir(uploadDir, { recursive: true });

        // final file path
        const filePath = join(uploadDir, uniqueName);

        // writing file to disk
        await writeFile(filePath, buffer);

        // extracting data from file
        const extractedData: string | PDFData = await extractText(uniqueName);

        // // breaking text into small chunks
        let extractedText = extractedData;

        console.log("text extracted successfully")

        await unlink(filePath); // delete the file after extracting text


        try {
            const chatId = clientUrlPath.split('/').at(-1);

            if (chatId === "chat") {
                //this is a new chat and we need to redirect
                const cid:string = crypto.randomUUID();
                // create a new chat in db and then upload doc with the chat id;
                await createNewChat(cid, userInfo.id); // 1
                await insertDocInDatabase(extractedText , fileBaseName , fileExtension , filesize , cid)
                // if the user also have a message with the upload then we will add it to db so later after redirect we can access at load.
                if(formData.get("message")){
                    const messageContent = formData.get("message");
                    console.log("This is the message content: " , messageContent)
                    const message:Message = {id:createId() , content:messageContent?.toString()!, index:1 , chatId:cid , isHuman:true}
                    // console.log("The full message obje" , message);
                    createNewMessage(message);
                }
                
                return NextResponse.redirect(new URL(`/chat/${cid}` , new URL(req.url)) , 303) // change status code from 307 to 303 to swithch req form post to get
            }
            else{
                await insertDocInDatabase(extractedText , fileBaseName , fileExtension , filesize , chatId!);
                console.log(chatId)
            }
            // const docId = await insertDocInDatabase(extractedText, fileBaseName, fileExtension, filesize)
            // return NextResponse.json({ success: true, message: `File saved successfully received`, documentId: docId });
        }
        catch (error) {
            throw error;
        }


    } catch (error) {
        console.log(`file saving failed: `, error);
        return NextResponse.json({ success: false, error: 'Server error saving file' }, { status: 500 });
    }
}

//after running upload doc we want to redirect the use to a new chat path with chat id